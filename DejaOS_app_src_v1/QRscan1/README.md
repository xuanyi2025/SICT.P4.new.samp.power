# Project Usage Guide

This is a brief guide for the HelloDejaOS application project developed based on DejaOS. For more details, please refer to https://dejaos.com

## Prerequisites

- DejaOS VSCode extension installed
- DejaOS-compatible development device purchased
- Internet connection (for downloading modules)

## Usage Steps

### 1. Configure Project Modules

1. Click on the `app.dxproj` file in the project root directory
2. Select your device model in the popup interface
3. Select the modules you want to use
4. Choose the latest version from the version history
5. Click the **Submit** button to confirm

### 2. Install Modules

1. Click the **Install** button in the bottom menu bar
2. The system will download all selected modules from the module cloud service
3. Modules will be automatically saved to the `dxmodules` directory

### 3. Connect Device

1. Connect the device to your computer using a USB cable
2. Ensure the device is properly recognized (check for HID-type devices in Device Manager)

### 4. Establish Connection

1. Click the **Connect** button in the bottom menu bar
2. Wait for the connection to succeed
3. After successful connection, more operation buttons will appear in the bottom menu bar

### 5. Sync Code and Modules

1. Click the **SynAll** button in the bottom menu bar
2. The system will sync all code and modules to the device
3. Wait for the sync to complete

### 6. Run Application

1. Click the **Start** button in the bottom menu bar
2. The application will launch and run on the device

### 7. Debug Application

1. Modify the code in the src directory
2. Click the **Syn** button in the bottom menu bar
3. The system will sync the changed code and modules to the device
4. Run the code to see the results

## Project Structure

```
testr/
├── app.dxproj          # Project configuration file
├── dxmodules/          # Modules directory (auto-generated)
│   └── dxLogger.js     # Logger module
├── src/                # Source code directory
│   └── main.js         # Main program entry
└── README.md           # This documentation
```
