"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message = "Loading..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`}
        />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}