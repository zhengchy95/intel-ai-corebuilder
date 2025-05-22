# Intel AI Corebuilder

<img src="src/assets/logo.png" alt="Intel AI Corebuilder Logo" width="120" align="right"/>

<span style="font-size:22px;">Overview</span>

Intel AI Corebuilder is a sophisticated and simplified user interface built with [Tauri v2](https://tauri.app/) that seamlessly connects to Intel AI Assistant Builder Services through gRPC.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-brightgreen)](https://github.com/zhengchy95/intel-ai-corebuilder/releases)

---

## 🚀 Features

- **Modern Desktop Experience** - Leverages Tauri to provide native performance with web technologies
- **Secure Communication** - Uses gRPC for efficient, type-safe communication with Intel AI Assistant Builder
- **Responsive Design** - Adapts to different screen sizes and resolutions
- **Hardware Acceleration** - Optimized for Intel processors and accelerators
- **Local LLM** - Run Generative AI on Intel AIPC without Internet connection

## 📋 Prerequisites

Before running Intel AI Corebuilder, you must:

1. **Download and install Intel AI Assistant Builder (v1.2.0.0517)**  
   This UI connects to the Assistant Builder application via gRPC.

   - Download from the [official Intel AI Assistant Builder website](https://aibuilder.intel.com)
   - Complete the installation process
   - Ensure the application is running and accessible on your system

2. **System Requirements**
   - OS: Windows 10/11
   - CPU: Intel® Core™ Ultra processor Series 1 (Meteor Lake) or later
   - GPU: Integrated Intel® Graphics
   - RAM: Minimum 16GB (32GB recommended)
   - Storage: 10GB available space
   - Network: Internet connection for model download on first startup

For detailed installation instructions specific to your platform, see our Installation Guide.

## 🧑‍💻 How to Use

1. **Download the latest release**  
   Go to the [Releases page](https://github.com/zhengchy95/intel-ai-corebuilder/releases) and download the intel-ai-corebuilder.exe

2. **Ensure Intel AI Assistant Builder is running**  
   The UI requires the Assistant Builder service to be active for full functionality.

3. **Start Intel AI Corebuilder**  
   Double-click the executable and make sure run it as administrator.


## 🏗️ Architecture

Intel AI Corebuilder follows a modular architecture:

- **Frontend**: Built with React and JavaScript
- **Backend**: Rust-based Tauri application
- **Communication**: gRPC for efficient data transfer
- **State Management**: Zustand

## 🛠️ Development

### Setting Up Development Environment

1. Install [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)
2. Install protoc following [Protobuf guide](https://protobuf.dev/installation/)

### 💻 Build Yourself

```bash
# Clone the repository
git clone https://github.com/zhengchy95/intel-ai-corebuilder.git

# Navigate to the project directory
cd intel-ai-corebuilder

# Install dependencies
npm install

# Start the application with vite
npm run tauri dev

# Build the application
npm run tauri build
```

### Project Structure

```
intel-ai-corebuilder/
├── src/               # Frontend source code
   ├── assets/         # Static files such as images, fonts, and icons used by the frontend
   ├── components/     # Reusable React UI components (buttons, modals, forms, etc.)
   ├── pages/          # Top-level React pages/views representing application routes
   ├── stores/         # Zustand state management stores and related logic
   ├── utils/          # Utility functions and helper modules for the frontend
├── src-tauri/         # Rust backend code
   ├── proto/          # Intel AI Assistant Builder Protocol Buffers definitions
```

## 📝 Contributing

We welcome contributions from the community!

## 📄 Versioning

We use [Semantic Versioning](https://semver.org/) for releases. For available versions, see the [tags on this repository](https://github.com/zhengchy95/intel-ai-corebuilder/tags).

## ❓ Troubleshooting

### Common Issues

- **Connection failed**: Ensure Intel AI Assistant Builder is running and the gRPC endpoint is correctly configured
- **Performance issues**: Verify your system meets the minimum requirements

## 🔐 Security

If you discover a security vulnerability, please follow our Security Policy for responsible disclosure.

## 👥 Team

- **Lead Developer**: [David Ozc](https://github.com/zhengchy95)
- **UX Designer**: [David Ozc](https://github.com/zhengchy95)
- **Core Contributors**: [See all contributors](https://github.com/intel/corebuilder/graphs/contributors)

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) for providing the framework
- Intel AI Assistant Builder team for their proto file open sourced at their [Github repo](https://github.com/intel/intel-ai-assistant-builder)
- All our contributors and users

<br>

---
_Intel AI Corebuilder is a personal project, not an Intel product._
