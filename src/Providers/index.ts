import {ReactNode} from "react";

export interface ProviderProps {
  children: ReactNode;
}

export { default as AuthProvider } from './AuthProvider/AuthProvider'