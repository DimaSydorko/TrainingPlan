import {ReactNode} from "react";
import AuthProvider, {AuthContext} from './AuthProvider/AuthProvider';
import PlansProvider, {PlansContext} from './PlansProvider/PlansProvider'
import WorkoutProvider, {WorkoutContext} from './WorkoutProvider/WorkoutProvider'

export interface ProviderProps {
  children: ReactNode;
}

export {
  AuthProvider,
  PlansProvider,
  WorkoutProvider,
  AuthContext,
  PlansContext,
  WorkoutContext,
}
