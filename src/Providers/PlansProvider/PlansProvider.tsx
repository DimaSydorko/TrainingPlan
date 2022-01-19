import {createContext} from "react";
import {ProviderProps} from "../index";
import {PlanType} from "../../Utils/types";
import usePlans from "../../Hooks/UsePlans/UsePlans";

interface PlansContextType {
  plans: PlanType[] | null;
}

export const PlansContext = createContext<PlansContextType>(null!);

export default function PlansProvider({children}: ProviderProps) {
  const {
    plans
  } = usePlans()

  return (
    <PlansContext.Provider value={{
      plans
    }}>
      {children}
    </PlansContext.Provider>
  )
}