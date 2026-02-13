"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { CheckCircle2, Loader2, User, Mail, Phone, Package, MessageSquare, Smartphone } from "lucide-react"
import { shopConfig } from "@/config/shop"

const formSchema = z.object({
    customerName: z.string().min(2, { message: "Required" }),
    customerEmail: z.string().email({ message: "Invalid email" }),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Add +country code" }),
    productName: z.string().min(2, { message: "Required" }),
    rating: z.string().min(1, { message: "Select" }),
    reviewText: z.string().min(20, { message: "Min 20 chars" }),
    sendSMS: z.boolean().default(false),
    sendWhatsApp: z.boolean().default(false),
}).refine((data) => data.sendSMS || data.sendWhatsApp, {
    message: "Select at least one notification method",
    path: ["sendWhatsApp"],
})

function StarRating({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [hoverRating, setHoverRating] = useState(0)
    const currentRating = parseInt(value) || 0

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star.toString())}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="relative p-1 transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none"
                >
                    <svg
                        className={`w-6 h-6 transition-colors duration-200 ${
                            star <= (hoverRating || currentRating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-300"
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                </button>
            ))}
        </div>
    )
}

export function ReviewForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            customerName: "",
            customerEmail: "",
            phoneNumber: "",
            productName: "",
            rating: "",
            reviewText: "",
            sendSMS: false,
            sendWhatsApp: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    shopName: shopConfig.name,
                    shopEmail: shopConfig.email,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to submit")
            }
            
            setIsSuccess(true)
        } catch (error) {
            console.error(error)
            form.setError("root", { 
                type: "manual", 
                message: error instanceof Error ? error.message : "Failed to submit" 
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="p-10 text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sent!</h3>
                <p className="text-sm text-gray-500 mb-6">Review request delivered</p>
                <Button
                    onClick={() => { setIsSuccess(false); form.reset(); }}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-6 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    New Request
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                {/* Section Header - Customer */}
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem className="px-4 py-3.5 space-y-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">Name</span>
                                    </div>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter name" 
                                            className="h-9 text-sm text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-gray-900 placeholder:text-gray-400"
                                            {...field} 
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-xs text-right text-red-500 px-8" />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="px-4 py-3.5 space-y-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </div>
                                    <FormControl>
                                        <Input 
                                            type="tel"
                                            placeholder="+91xxxxxxxxxx" 
                                            className="h-9 text-sm text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-gray-900 placeholder:text-gray-400"
                                            {...field} 
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-xs text-right text-red-500 px-8" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                            <FormItem className="px-4 py-3.5 space-y-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">Email</span>
                                    </div>
                                    <FormControl>
                                        <Input 
                                            type="email"
                                            placeholder="email@example.com" 
                                            className="h-9 text-sm text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-gray-900 placeholder:text-gray-400"
                                            {...field} 
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-xs text-right text-red-500 px-8" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section Header - Product */}
                <div className="px-4 py-3 bg-gray-100 border-y border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                    <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                            <FormItem className="px-4 py-3.5 space-y-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium">Item</span>
                                    </div>
                                    <FormControl>
                                        <Input 
                                            placeholder="Product name" 
                                            className="h-9 text-sm text-right border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-gray-900 placeholder:text-gray-400"
                                            {...field} 
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-xs text-right text-red-500 px-8" />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem className="px-4 py-3.5 space-y-0">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-gray-700">Rating</span>
                                    <FormControl>
                                        <StarRating 
                                            value={field.value} 
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-xs text-right text-red-500" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section Header - Review */}
                <div className="px-4 py-3 bg-gray-100 border-y border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Review</h3>
                </div>

                <FormField
                    control={form.control}
                    name="reviewText"
                    render={({ field }) => (
                        <FormItem className="px-4 py-4 space-y-1">
                            <FormControl>
                                <Textarea
                                    placeholder={shopConfig.whatsappMessage}
                                    className="min-h-[100px] text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none text-gray-900 placeholder:text-gray-400 leading-relaxed"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs text-right text-red-500" />
                        </FormItem>
                    )}
                />

                {/* Section Header - Send Via */}
                <div className="px-4 py-3 bg-gray-100 border-y border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Send Via</h3>
                </div>

                <div className="px-4 py-4 space-y-3">
                    <FormField
                        control={form.control}
                        name="sendSMS"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </FormControl>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Smartphone className="w-4 h-4 text-gray-400" />
                                    <span>SMS</span>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sendWhatsApp"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </FormControl>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span>WhatsApp</span>
                                </div>
                            </FormItem>
                        )}
                    />

                    {form.formState.errors.root && (
                        <p className="text-xs text-red-500">{form.formState.errors.root.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="p-4 pt-2 bg-gray-50 border-t border-gray-200">
                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-semibold bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Review Request"
                        )}
                    </Button>

                    <p className="text-center text-xs text-gray-400 mt-3">
                        {shopConfig.name}
                    </p>
                </div>
            </form>
        </Form>
    )
}