
import { MessageSquare } from "lucide-react";

const NoMessages = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6">
    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-medium mb-1">No messages yet</h3>
    <p className="text-muted-foreground text-sm">
      Start the conversation by sending a message below
    </p>
  </div>
);

export default NoMessages;
