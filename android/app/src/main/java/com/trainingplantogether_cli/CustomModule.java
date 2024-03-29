package com.trainingplantogether_cli;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

public class CustomModule extends ReactContextBaseJavaModule {
    CustomModule(ReactApplicationContext context) {
        super(context);
    }
    @Override
    public String getName() {
        return "CustomModule";
    }

    @ReactMethod
    public void createKeepAwake(Callback callback) {
        Log.d("CustomModule","Invoke createKeepAwake");
        callback.invoke("Return from createKeepAwake");
    }
}
