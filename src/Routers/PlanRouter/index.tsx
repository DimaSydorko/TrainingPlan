import PlanRouter from "./PlanRouter";
import {PlansProvider, WorkoutProvider} from "../../Providers";

export default function PlanRouterIndex() {
  return (
    <PlansProvider>
      <WorkoutProvider>
        <PlanRouter/>
      </WorkoutProvider>
    </PlansProvider>
  )
}