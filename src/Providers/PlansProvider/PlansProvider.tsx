import {createContext} from "react";
import {ProviderProps} from "../index";
import {PlanType} from "../../Utils/types";
import usePlans from "../../Hooks/UsePlans/UsePlans";

interface PlansContextType {
  plans: PlanType[] | null;
  addPlan: (plan: PlanType) => Promise<void>;
  deletePlan: (plan: PlanType) => Promise<void>;
  updatePlan: (plan: PlanType) => Promise<void>;
}

export const PlansContext = createContext<PlansContextType>(null!);

export default function PlansProvider({children}: ProviderProps) {
  const {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
  } = usePlans()

  return (
    <PlansContext.Provider value={{
      plans,
      updatePlan,
      addPlan,
      deletePlan,
    }}>
      {children}
    </PlansContext.Provider>
  )
}