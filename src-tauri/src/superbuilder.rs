pub mod super_builder {
    tonic::include_proto!("super_builder");
}
use futures::stream::StreamExt;
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;
use super_builder::super_builder_client::SuperBuilderClient;
use super_builder::ChatRequest;
use tauri::Emitter;
use tauri::State;
use tauri::Window;
use tokio::sync::Mutex;

pub type SharedClient = Arc<Mutex<Option<SuperBuilderClient<tonic::transport::Channel>>>>;

#[tauri::command]
pub async fn initialize_client() -> SharedClient {
    Arc::new(Mutex::new(None))
}

#[tauri::command]
pub async fn connect_client(client: State<'_, SharedClient>) -> Result<String, String> {
    let new_client = SuperBuilderClient::connect("http://127.0.0.1:5006")
        .await
        .map_err(|_e| format!("Failed to connect to middleware."))?;

    let mut client_guard = client.lock().await;
    *client_guard = Some(new_client);

    Ok("Connected".to_string())
}

#[tauri::command]
pub async fn get_config(
    db_client: tauri::State<'_, SharedClient>,
    assistant: String,
) -> Result<String, String> {
    // Get a mutable reference to the QueryClient from the shared state
    let mut client_guard = db_client.lock().await;
    let db_client_ref = client_guard.as_mut().ok_or("Client not initialized")?;
    // Create the QueryRequest
    let request = super_builder::GetClientConfigRequest { assistant };

    // Perform the gRPC query
    let response = db_client_ref
        .get_client_config(request)
        .await
        .map_err(|e| format!("Failed to query database: {}", e))?;

    // Extract the message from the QueryReply
    let reply = response.into_inner();
    Ok(reply.data)
}

#[tauri::command]
pub async fn download_model(
    client: State<'_, SharedClient>,
    file_url: String,
    local_path: String,
    token_id: Option<String>,
    window: Window,
) -> Result<String, String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    let request = super_builder::DownloadFilesRequest {
        file_url: file_url.clone(),
        local_path,
        token_id,
    };

    let mut response_stream = client_ref
        .download_files(request)
        .await
        .map_err(|e| format!("Failed to download file: {}", e))?
        .into_inner();
    let mut last_file_downloaded = String::new();
    while let Some(download_response) = response_stream
        .message()
        .await
        .map_err(|e| format!("Error receiving download progress: {}", e))?
    {
        // Emit the progress to the frontend
        let download_file = file_url.clone();
        let progress_data = download_response.progress;
        last_file_downloaded = download_response.file_downloaded.clone();
        // Emit the event to the React frontend
        window
            .emit("download-progress", (download_file, progress_data))
            .map_err(|e| format!("Failed to emit progress event: {}", e))?;

        // Check if the download is complete
        if download_response.progress == 100 {
            return Ok(download_response.file_downloaded);
        }
    }

    Err(format!("{}", last_file_downloaded))
}

#[tauri::command]
pub async fn update_db_models(
    client: State<'_, SharedClient>,
    assistant: String,
    models_json: String,
) -> Result<String, String> {
    let mut client_guard = client.lock().await;
    let db_client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    let request = super_builder::SetActiveAssistantRequest {
        assistant: assistant.into(),
        models_json: models_json.into(),
    };

    let response = db_client_ref
        .set_active_assistant(request)
        .await
        .map_err(|e| format!("Failed to query database: {}", e))?;

    if response.into_inner().success {
        println!("Model updated successfully.");
    }

    Ok("Model updated successfully.".to_string())
}

#[tauri::command]
pub async fn load_models(
    _window: tauri::Window,
    client: State<'_, SharedClient>,
) -> Result<bool, String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    // Build and send load models request
    let request = super_builder::LoadModelsRequest {};
    let response = client_ref
        .load_models(request)
        .await
        .map_err(|e| format!("Failed to load models: {}", e))?;
    let reply = response.into_inner();
    Ok(reply.status)
}

#[tauri::command]
pub async fn check_pyllm(client: State<'_, SharedClient>) -> Result<String, String> {
    // Lock the Mutex and ensure the client is mutable
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    let request = super_builder::SayHelloRequest {
        name: "CoreUI".to_string(),
    };

    let response = client_ref
        .say_hello_pyllm(request)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    // Extract the actual HealthReply message from the tonic::Response
    let reply = response.into_inner();

    Ok(reply.message.to_string())
}

#[derive(Deserialize)]
pub struct ChatMessage {
    #[serde(rename = "Role")]
    role: String,
    #[serde(rename = "Content")]
    content: String,
}

#[tauri::command]
pub async fn call_chat(
    window: tauri::Window,
    client: State<'_, SharedClient>,
    name: String,
    prompt: String,
    conversation_history: Vec<ChatMessage>,
    sid: i32,              // session id to add chat messages to
    query: Option<String>, // type of query to use on a set of files
    files: Option<String>, // files to use specifically for this query
) -> Result<(), String> {
    // Clone the client reference to avoid holding the lock for the entire function
    let mut client_ref = {
        let mut client_guard = client.lock().await;
        client_guard
            .as_mut()
            .ok_or("Client not initialized")?
            .clone()
    };

    // Convert the incoming messages to ConversationHistory
    let history: Vec<super_builder::ConversationHistory> = conversation_history
        .into_iter()
        .map(|msg| super_builder::ConversationHistory {
            role: msg.role,
            content: msg.content,
        })
        .collect();

    let request = ChatRequest {
        name: name,
        prompt: prompt,
        history: history,
        session_id: sid,
        attached_files: files,
        query_type: query,
    };

    let response = client_ref
        .chat(request)
        .await
        .map_err(|e| format!("Failed to send chat: {}", e))?;

    let mut stream = response.into_inner();

    let mut stop_flag = false;
    while let Some(message) = stream.next().await {
        if stop_flag == false {
            let _ = window.emit("first_word", stop_flag);
        }
        stop_flag = true;
        match message {
            Ok(chat_response) => {
                let msg: Value = serde_json::from_str(&chat_response.message)
                    .expect("failed to read response message");
                if let Some(message) = msg["message"].as_str() {
                    // println!("bb: {}", message);
                    window
                        .emit("new_message", message)
                        .map_err(|e| format!("Failed to emit message: {}", e))?;
                }
            }
            Err(e) => {
                // Send stop signal to backend to stop chat generation
                println!("Sending stop signal to backend to stop chat generation");
                let request = super_builder::StopChatRequest {};
                let response = client_ref
                    .stop_chat(request)
                    .await
                    .map_err(|e| format!("Failed to stop chat: {}", e))?;
                let _reply = response.into_inner();
                window
                    .emit("stream-completed", true)
                    .expect("Failed to emit stream completed event");
                return Err(format!("Stream error: {}", e));
            }
        }
    }

    window
        .emit("stream-completed", true)
        .expect("Failed to emit stream completed event");

    Ok(())
}

// Attempt to stop backend chat generation early
#[tauri::command]
pub async fn stop_chat(
    _window: tauri::Window,
    client: State<'_, SharedClient>,
) -> Result<(), String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    // Build and send stop chat request
    let request = super_builder::StopChatRequest {};
    let response = client_ref
        .stop_chat(request)
        .await
        .map_err(|e| format!("Failed to stop chat: {}", e))?;
    let _reply = response.into_inner();
    // println!("Chat canceled");
    Ok(())
}

#[tauri::command]
pub async fn get_chat_history(client: tauri::State<'_, SharedClient>) -> Result<String, String> {
    // Get a mutable reference to the QueryClient from the shared state
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;
    // Create the QueryRequest
    let request = super_builder::GetChatHistoryRequest {};

    // Perform the gRPC query
    let response = client_ref
        .get_chat_history(request)
        .await
        .map_err(|e| format!("Failed to query database: {}", e))?;

    // Extract the message from the QueryReply
    let reply = response.into_inner();
    Ok(reply.data)
}

#[tauri::command]
pub async fn rename_chat_session(
    client: tauri::State<'_, SharedClient>,
    sid: i32, // int32 required for GRPC
    name: String,
) -> Result<bool, String> {
    // Get a mutable reference to the QueryClient from the shared state
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    // Create the QueryRequest
    let request = super_builder::SetSessionNameRequest {
        session_id: sid,
        session_name: name,
    };

    // Perform the gRPC query
    let response = client_ref
        .set_session_name(request)
        .await
        .map_err(|e| format!("Failed to query database: {}", e))?;

    // Extract the message from the QueryReply
    let reply = response.into_inner();
    Ok(reply.success)
}

#[tauri::command]
pub async fn remove_chat_session(
    client: tauri::State<'_, SharedClient>,
    sid: i32, // int32 required for GRPC
) -> Result<bool, String> {
    // Get a mutable reference to the QueryClient from the shared state
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;
    // Create the QueryRequest
    let request = super_builder::RemoveSessionRequest { session_id: sid };

    // Perform the gRPC query
    let response = client_ref
        .remove_session(request)
        .await
        .map_err(|e| format!("Failed to query database: {}", e))?;

    // Extract the message from the QueryReply
    let reply = response.into_inner();
    Ok(reply.success)
}

#[tauri::command]
pub async fn upload_file(
    window: tauri::Window,
    client: State<'_, SharedClient>,
    paths: String,
) -> Result<(), String> {
    // Clone the client reference to avoid holding the lock for the entire function
    let mut client_ref = {
        let mut client_guard = client.lock().await;
        client_guard
            .as_mut()
            .ok_or("Client not initialized")?
            .clone()
    };

    let request = super_builder::AddFilesRequest {
        files_to_upload: paths,
    };

    let response = client_ref
        .add_files(request)
        .await
        .map_err(|e| format!("Failed to upload file: {}", e))?;

    // Stream back file upload progress
    let mut files_uploaded_result = String::from("");
    let mut stream = response.into_inner();
    while let Some(message) = stream.next().await {
        match message {
            Ok(file_response) => {
                let files_uploaded = file_response.files_uploaded;
                files_uploaded_result = files_uploaded.clone();
                let mut current_file_progress = String::from("No progress");
                let mut current_file_uploading = String::from("No file");

                // Set optional fields if they exist
                if let Some(current_file) = &file_response.current_file_uploading {
                    current_file_uploading = current_file.clone();
                }
                if let Some(file_progress) = &file_response.current_file_progress {
                    current_file_progress = file_progress.clone();
                }

                let msg = json!({
                    "files_uploaded": files_uploaded,
                    "current_file_uploading": current_file_uploading,
                    "current_file_progress": current_file_progress,
                });

                // Emit the file progress to invoker
                window
                    .emit("upload-progress", msg)
                    .map_err(|e| format!("Failed to emit message: {}", e))?;
            }
            Err(e) => return Err(format!("Stream error: {}", e)),
        }
    }

    // Inform window that upload request is complete with final uploaded files result
    // println!("Returning files uploaded result: {}", files_uploaded_result);
    window
        .emit("upload-completed", files_uploaded_result)
        .expect("Failed to emit stream completed event");
    Ok(())
}

// Attempt to stop backend file upload early
#[tauri::command]
pub async fn stop_upload_file(
    _window: tauri::Window,
    client: State<'_, SharedClient>,
) -> Result<(), String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;
    // Build and send stop upload file request
    let request = super_builder::StopAddFilesRequest {};
    let response = client_ref
        .stop_add_files(request)
        .await
        .map_err(|e| format!("Failed to stop upload file: {}", e))?;
    let _reply = response.into_inner();
    // println!("File upload canceled");
    Ok(())
}

#[tauri::command]
pub async fn remove_file(
    client: State<'_, SharedClient>,
    files: String, // This should be the file content sent from the frontend
) -> Result<String, String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    let request = super_builder::RemoveFilesRequest {
        files_to_remove: files,
    };

    let response = client_ref
        .remove_files(request)
        .await
        .map_err(|e| format!("Failed to remove file: {}", e))?;

    let reply = response.into_inner();
    Ok(reply.files_removed)
}

#[tauri::command]
pub async fn get_file_list(client: State<'_, SharedClient>) -> Result<String, String> {
    let mut client_guard = client.lock().await;
    let client_ref = client_guard.as_mut().ok_or("Client not initialized")?;

    let request = super_builder::GetFileListRequest {
        file_type: "".to_string(),
    };

    let response = client_ref
        .get_file_list(request)
        .await
        .map_err(|e| format!("Failed to get file list: {}", e))?;

    let reply = response.into_inner();

    Ok(reply.file_list)
}
