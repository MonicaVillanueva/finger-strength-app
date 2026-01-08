
# Development

1. Create a custom expo app: Because Bluetooth requires low-level hardware access, you cannot use the standard "Expo Go" app from the store. Instead, you must build a "Development Client", basically your own custom version of the Expo Go app that includes the Bluetooth drivers.
* Install the EAS CLI: `npm install -g eas-cli`
* Login: `eas login`
* Configure (Select Android): `eas build:configure`
* Build a development client:
    ```
    eas build --profile development --platform android
    ```

    Wait for the build to finish, download the .apk file, and install it on your phone. Use it instead of the standard Expo app whenever you are developing, e.g. when you scan the QR code after starting the server with `npx expo start --dev-client`.

2. Debug:
* Start the server: `npx expo start --dev-client`
* Connect on the phone using the QR code.
* Open the menu in the phone by shaking it and click on "JS debugger": The React NativeDevTools window will open.
* Go to the "Sources" tab and use it to create breakpoints and debug.

# Production
* Build the production APK development:
    ```
    * eas build --platform android --profile production
    ```

    Wait for the build to finish, download the .apk file, and install it on your phone. Note: If you haven't logged in, it will ask you to run `eas login`.