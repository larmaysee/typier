import { Button } from "./ui/button";

export default function DataMode() {
  return (
    <div className="flex">
      <Button
        variant="secondary"
        size={"sm"}
        className="border-r-0 rounded-r-none"
      >
        <span className="text-sm">Char</span>
      </Button>
      <Button variant="secondary" size={"sm"} className="rounded-l-none">
        <span className="text-sm">Syntax</span>
      </Button>
    </div>
  );
}
