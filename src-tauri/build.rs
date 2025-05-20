fn main() {
    tauri_build::build();
    tonic_build::compile_protos("src/proto/superbuilder.proto")
        .unwrap_or_else(|e| panic!("Failed to compile protos {:?}", e));
}
