import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="px-4 py-4 text-md rounded-md shadow-md gap-3"
          >
            <div className="grid gap-1">
              {" "}
              {title && (
                <ToastTitle className="font-semibold text-[15px]">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="gap-2 p-3" />{" "}
    </ToastProvider>
  );
}
