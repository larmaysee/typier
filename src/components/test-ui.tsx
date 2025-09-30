"use client";
import { TypingContainer } from "@/presentation/components/typing/typing-container";
import Keyboard from "./keyboard";
import { PracticeModeProvider } from "./pratice-mode";

export default function TestUi() {
  return (
    <PracticeModeProvider>
      <TypingContainer />
      <Keyboard />
    </PracticeModeProvider>
  );
}
