package com.our_children;

import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  @Override
   protected void onCreate(Bundle savedInstanceState) {
       SplashScreen.show(this);
       super.onCreate(savedInstanceState);
   }

  //  @Override
  //     public void onConfigurationChanged(Configuration newConfig) {
  //       super.onConfigurationChanged(newConfig);
  //       Intent intent = new Intent("onConfigurationChanged");
  //       intent.putExtra("newConfig", newConfig);
  //       this.sendBroadcast(intent);
  //   }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "our_children";
  }
}
