
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const Loading = ({ size = 24, message = "Loading...", fullScreen = false }: LoadingProps) => {
  const loadingContent = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="animate-spin" size={size} />
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="h-screen w-full flex items-center justify-center">{loadingContent}</div>;
  }

  return loadingContent;
};

export default Loading;
