import "./styles.css";
import { MultipleContainers } from "./MultipleContainers";

export default function Kanban() {
  return (
    <MultipleContainers
      containerStyle={{
        maxHeight: "80vh"
      }}
      itemCount={15}
      scrollable
    />
  );
}
