mod superbuilder;
use reqwest;
use tauri::Manager;
use whoami;

#[tauri::command]
fn get_username() -> String {
    let username = whoami::username();
    println!("Current Windows username: {}", username);

    username
}

#[tauri::command]
async fn get_hf_model_info(model_id: String) -> Result<String, String> {
    let url = format!("https://huggingface.co/api/models/{}", model_id);
    let resp = reqwest::get(&url)
        .await
        .map_err(|e| format!("Request error: {}", e))?
        .text()
        .await
        .map_err(|e| format!("Read error: {}", e))?;
    Ok(resp)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let client = tokio::runtime::Runtime::new()
                .unwrap()
                .block_on(superbuilder::initialize_client());
            app.manage(client);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_username,
            get_hf_model_info,
            superbuilder::connect_client,
            superbuilder::get_config,
            superbuilder::download_model,
            superbuilder::load_models,
            superbuilder::update_db_models,
            superbuilder::check_pyllm,
            superbuilder::get_chat_history,
            superbuilder::call_chat,
            superbuilder::stop_chat,
            superbuilder::remove_chat_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
