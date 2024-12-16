"use client";
import DataBox from './data-box';
import Keyboard from './keyboard';
import { PracticeModeProvider } from './pratice-mode';

export default function TestUi() {
  return (
    <PracticeModeProvider>
      <DataBox />
      <Keyboard />
    </PracticeModeProvider>
  );
}
