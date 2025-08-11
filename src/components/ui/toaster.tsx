"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const icons = {
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    destructive: <XCircle className="h-6 w-6 text-destructive" />,
    default: <Info className="h-6 w-6 text-primary" />,
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
               <div className="flex-shrink-0">
                 {icons[variant as keyof typeof icons] || icons.default}
               </div>
               <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
