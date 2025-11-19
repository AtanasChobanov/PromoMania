import { Stack } from "expo-router";
import React from "react";

export default function LoginLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* No need to declare each screen here. 
          The files index.tsx, login.tsx, register.tsx, optionsRegister.tsx
          automatically become screens. */}
    </Stack>
  );
}