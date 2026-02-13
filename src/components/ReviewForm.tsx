"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Building2, 
    User, 
    ShoppingBag, 
    Star, 
    ArrowRight, 
    ArrowLeft,
    Sparkles,
    Loader2,
    CheckCircle2,
    RefreshCw,
    Share2,
    Brain,
    Zap,
    Target,
    TrendingUp,
    Heart,
    Wallet,
    Award,
    Smartphone,
    Clock,
    ThumbsUp,
    Lightbulb,
    Wand2,
    Sparkle,
    Bot,
    Check,
    Calendar
} from "lucide-react"
import { shopConfig } from "@/config/shop"

// Kalyaa Jewellers Shop Locations
const SHOP_LOCATIONS = [
    { value: "mumbai_mg_road", label: "Mumbai - M.G. Road", address: "123 M.G. Road, Mumbai" },
    { value: "mumbai_bandra", label: "Mumbai - Bandra West", address: "45 Hill Road, Bandra, Mumbai" },
    { value: "mumbai_andheri", label: "Mumbai - Andheri East", address: "78 Andheri Kurla Road, Mumbai" },
    { value: "pune_fc_road", label: "Pune - F.C. Road", address: "256 F.C. Road, Pune" },
    { value: "pune_camp", label: "Pune - Camp", address: "89 M.G. Road, Camp, Pune" },
    { value: "delhi_karol_bagh", label: "Delhi - Karol Bagh", address: "45 Ajmal Khan Road, Karol Bagh, Delhi" },
    { value: "delhi_south_ext", label: "Delhi - South Extension", address: "12 South Extension Part I, Delhi" },
    { value: "bangalore_brigade", label: "Bangalore - Brigade Road", address: "78 Brigade Road, Bangalore" },
    { value: "bangalore_indiranagar", label: "Bangalore - Indiranagar", address: "34 100 Feet Road, Indiranagar, Bangalore" },
    { value: "hyderabad_banjara", label: "Hyderabad - Banjara Hills", address: "23 Road No. 1, Banjara Hills, Hyderabad" },
    { value: "chennai_t_nagar", label: "Chennai - T. Nagar", address: "67 North Usman Road, T. Nagar, Chennai" },
    { value: "kolkata_park_st", label: "Kolkata - Park Street", address: "15 Park Street, Kolkata" },
]

// Step 1: Organization Schema
const orgSchema = z.object({
    orgName: z.string().default("Kalyaa Jewellers"),
    orgType: z.string().default("Jewellery Store"),
    attenderName: z.string().min(2, "Attender name is required"),
    shopLocation: z.string().min(1, "Shop location is required"),
    orgDescription: z.string().optional(),
})

// Step 2: Customer & Purchase Schema with multi-select options
const customerSchema = z.object({
    customerName: z.string().min(2, "Customer name is required"),
    customerPhone: z.string().min(10, "Valid phone number required"),
    purchaseType: z.string().min(2, "What was purchased is required"),
    purchaseFrequency: z.string().min(1, "Purchase frequency is required"),
    purchaseDuration: z.string().optional(),
    satisfactionLevel: z.string().min(1).max(10),
    keyHighlights: z.string().optional(),
    improvementAreas: z.string().optional(),
    recommendationLikelihood: z.string().min(1).max(10),
    // Event field with others option
    events: z.array(z.string()).default([]),
    eventOther: z.string().optional(),
    // Multi-select arrays for psychological insights
    shoppingMotivation: z.array(z.string()).default([]),
    priceSensitivity: z.string().default(""),
    brandLoyalty: z.string().default(""),
    emotionalConnection: z.string().default(""),
})

type Step = 1 | 2 | 3

interface GeneratedReview {
    review: string
    whatsappLink: string
}

// Multi-select options based on psychological research
const MOTIVATION_OPTIONS = [
    { value: "quality", label: "Quality & Craftsmanship", icon: "✨", color: "bg-violet-100 border-violet-300 text-violet-700" },
    { value: "price", label: "Price & Value", icon: "💰", color: "bg-green-100 border-green-300 text-green-700" },
    { value: "brand", label: "Brand Reputation", icon: "🏆", color: "bg-amber-100 border-amber-300 text-amber-700" },
    { value: "design", label: "Design & Aesthetics", icon: "🎨", color: "bg-pink-100 border-pink-300 text-pink-700" },
    { value: "convenience", label: "Convenience", icon: "⚡", color: "bg-blue-100 border-blue-300 text-blue-700" },
    { value: "recommendation", label: "Recommendation", icon: "👥", color: "bg-indigo-100 border-indigo-300 text-indigo-700" },
    { value: "emotional", label: "Emotional Connection", icon: "❤️", color: "bg-rose-100 border-rose-300 text-rose-700" },
]

// Event options for multi-select with "Others" option
const EVENT_OPTIONS = [
    { value: "wedding", label: "Wedding", icon: "💒", color: "bg-pink-100 border-pink-300 text-pink-700" },
    { value: "engagement", label: "Engagement", icon: "💍", color: "bg-rose-100 border-rose-300 text-rose-700" },
    { value: "anniversary", label: "Anniversary", icon: "🎉", color: "bg-purple-100 border-purple-300 text-purple-700" },
    { value: "birthday", label: "Birthday", icon: "🎂", color: "bg-amber-100 border-amber-300 text-amber-700" },
    { value: "festival", label: "Festival (Diwali, etc.)", icon: "🪔", color: "bg-orange-100 border-orange-300 text-orange-700" },
    { value: "gift", label: "Gift", icon: "🎁", color: "bg-red-100 border-red-300 text-red-700" },
    { value: "investment", label: "Investment", icon: "📈", color: "bg-green-100 border-green-300 text-green-700" },
    { value: "daily_wear", label: "Daily Wear", icon: "✨", color: "bg-blue-100 border-blue-300 text-blue-700" },
    { value: "other", label: "Others", icon: "📝", color: "bg-gray-100 border-gray-300 text-gray-700" },
]

const PRICE_SENSITIVITY_OPTIONS = [
    { value: "very_high", label: "Very High", description: "Always compare prices", icon: "🔍" },
    { value: "high", label: "High", description: "Price matters a lot", icon: "💭" },
    { value: "medium", label: "Medium", description: "Balance price & quality", icon: "⚖️" },
    { value: "low", label: "Low", description: "Quality over price", icon: "💎" },
    { value: "very_low", label: "Premium", description: "Willing to pay more", icon: "👑" },
]

const BRAND_LOYALTY_OPTIONS = [
    { value: "new", label: "New Customer", description: "First purchase", icon: "🆕" },
    { value: "occasional", label: "Occasional", description: "Buy sometimes", icon: "🌟" },
    { value: "regular", label: "Regular", description: "Consistent buyer", icon: "🔄" },
    { value: "strong", label: "Strong Advocate", description: "Recommends to others", icon: "📢" },
    { value: "loyal", label: "Lifelong Loyal", description: "Brand is part of them", icon: "💎" },
]

const EMOTIONAL_CONNECTION_OPTIONS = [
    { value: "very_strong", label: "Very Connected", description: "Brand is identity", icon: "🔥" },
    { value: "strong", label: "Connected", description: "Positive feelings", icon: "💖" },
    { value: "moderate", label: "Moderate", description: "Generally positive", icon: "🙂" },
    { value: "neutral", label: "Neutral", description: "No strong feelings", icon: "😐" },
    { value: "weak", label: "Detached", description: "Little connection", icon: "🌊" },
]

const PURCHASE_FREQUENCY_OPTIONS = [
    { value: "first_time", label: "First-time Buyer", icon: "🎯" },
    { value: "rarely", label: "Rarely", description: "Once a year", icon: "📅" },
    { value: "occasionally", label: "Occasionally", description: "Few times a year", icon: "🌸" },
    { value: "regularly", label: "Regularly", description: "Monthly", icon: "📊" },
    { value: "frequently", label: "Frequently", description: "Weekly/Daily", icon: "🚀" },
]

function StepIndicator({ currentStep }: { currentStep: Step }) {
    const steps = [
        { icon: Building2, label: "Business" },
        { icon: User, label: "Customer" },
        { icon: Sparkles, label: "Review" },
    ]
    
    return (
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2 mx-8" />
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full -translate-y-1/2 mx-8 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />
                
                {steps.map((step, index) => {
                    const stepNum = (index + 1) as Step
                    const isActive = currentStep === stepNum
                    const isCompleted = currentStep > stepNum
                    const Icon = step.icon
                    
                    return (
                        <div key={stepNum} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
                                ${isActive 
                                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-violet-500/40 scale-110' 
                                    : isCompleted
                                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/40'
                                        : 'bg-white text-gray-400 shadow-gray-200'
                                }
                            `}>
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            <span className={`
                                text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300
                                ${isActive ? 'text-violet-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function PremiumBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-full border border-violet-200">
            <Sparkle className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Premium</span>
        </div>
    )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    )
}

function RatingSlider({ 
    value, 
    onChange, 
    label,
    icon: Icon
}: { 
    value: string; 
    onChange: (value: string) => void; 
    label: string;
    icon?: React.ElementType;
}) {
    const numValue = parseInt(value) || 5
    
    return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50/50 to-white rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-violet-500" />}
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {numValue}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">/10</span>
                </div>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={numValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #d946ef ${(numValue - 1) * 11.11}%, #e5e7eb ${(numValue - 1) * 11.11}%, #e5e7eb 100%)`
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                <span>Poor</span>
                <span>Excellent</span>
            </div>
        </div>
    )
}

// Multi-select component for shopping motivation
function MultiSelectMotivation({ 
    value, 
    onChange 
}: { 
    value: string[]; 
    onChange: (value: string[]) => void;
}) {
    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue))
        } else {
            onChange([...value, optionValue])
        }
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Select all that apply (tap to select/deselect)</p>
            <div className="grid grid-cols-2 gap-2">
                {MOTIVATION_OPTIONS.map((option) => {
                    const isSelected = value.includes(option.value)
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleOption(option.value)}
                            className={`
                                relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                                ${isSelected 
                                    ? option.color + ' border-current shadow-md scale-[0.98]' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg">{option.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${isSelected ? 'text-current' : 'text-gray-700'}`}>
                                        {option.label}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-current rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// Multi-select component for events with "Others" option
function MultiSelectEventsWithOther({ 
    value, 
    onChange,
    otherValue,
    onOtherChange
}: { 
    value: string[]; 
    onChange: (value: string[]) => void;
    otherValue: string;
    onOtherChange: (value: string) => void;
}) {
    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue))
        } else {
            onChange([...value, optionValue])
        }
    }

    const isOtherSelected = value.includes("other")

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Select all that apply (tap to select/deselect)</p>
            <div className="grid grid-cols-2 gap-2">
                {EVENT_OPTIONS.map((option) => {
                    const isSelected = value.includes(option.value)
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleOption(option.value)}
                            className={`
                                relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                                ${isSelected 
                                    ? option.color + ' border-current shadow-md scale-[0.98]' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg">{option.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${isSelected ? 'text-current' : 'text-gray-700'}`}>
                                        {option.label}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-current rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
            
            {/* Show input when "Others" is selected */}
            {isOtherSelected && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in slide-in-from-top-2">
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                        Please specify the event:
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter custom event..."
                        value={otherValue}
                        onChange={(e) => onOtherChange(e.target.value)}
                        className="h-10 text-sm border-gray-300 rounded-lg focus:border-violet-500 focus:ring-violet-500/20"
                    />
                </div>
            )}
        </div>
    )
}

// Single-select card component
function SelectCard({ 
    options, 
    value, 
    onChange,
    showDescription = true
}: { 
    options: { value: string; label: string; description?: string; icon: string }[]; 
    value: string; 
    onChange: (value: string) => void;
    showDescription?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-2">
            {options.map((option) => {
                const isSelected = value === option.value
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`
                            relative p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3
                            ${isSelected 
                                ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-500 shadow-md' 
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1 text-left">
                            <p className={`text-sm font-semibold ${isSelected ? 'text-violet-700' : 'text-gray-700'}`}>
                                {option.label}
                            </p>
                            {showDescription && option.description && (
                                <p className={`text-xs ${isSelected ? 'text-violet-500' : 'text-gray-500'}`}>
                                    {option.description}
                                </p>
                            )}
                        </div>
                        {isSelected && (
                            <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

interface FormData {
    orgName?: string;
    orgType?: string;
    attenderName?: string;
    shopLocation?: string;
    orgDescription?: string;
    customerName?: string;
    customerPhone?: string;
    purchaseType?: string;
    purchaseFrequency?: string;
    purchaseDuration?: string;
    satisfactionLevel?: string;
    keyHighlights?: string;
    improvementAreas?: string;
    recommendationLikelihood?: string;
    events?: string[];
    eventOther?: string;
    shoppingMotivation?: string[];
    priceSensitivity?: string;
    brandLoyalty?: string;
    emotionalConnection?: string;
}

export function ReviewForm() {
    const [currentStep, setCurrentStep] = useState<Step>(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedReview, setGeneratedReview] = useState<GeneratedReview | null>(null)
    const [formData, setFormData] = useState<FormData>({})

    const orgForm = useForm<z.infer<typeof orgSchema>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(orgSchema as any),
        defaultValues: {
            orgName: "Kalyaa Jewellers",
            orgType: "Jewellery Store",
            attenderName: "",
            shopLocation: "",
            orgDescription: "",
        },
    })

    const customerForm = useForm<z.infer<typeof customerSchema>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(customerSchema as any),
        defaultValues: {
            customerName: "",
            customerPhone: "",
            purchaseType: "",
            purchaseFrequency: "",
            purchaseDuration: "",
            satisfactionLevel: "8",
            keyHighlights: "",
            improvementAreas: "",
            recommendationLikelihood: "9",
            events: [],
            eventOther: "",
            shoppingMotivation: [],
            priceSensitivity: "",
            brandLoyalty: "",
            emotionalConnection: "",
        },
    })

    const onOrgSubmit = (values: z.infer<typeof orgSchema>) => {
        setFormData((prev: FormData) => ({ ...prev, ...values }))
        setCurrentStep(2)
    }

    const onCustomerSubmit = async (values: z.infer<typeof customerSchema>) => {
        const fullData = { ...formData, ...values }
        setFormData(fullData)
        setIsGenerating(true)

        try {
            const response = await fetch("/api/generate-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fullData),
            })

            if (!response.ok) {
                throw new Error("Failed to generate review")
            }

            const data = await response.json()
            
            const whatsappText = encodeURIComponent(data.review)
            const customerPhone = (fullData.customerPhone || '').replace(/\s+/g, '').replace(/^0+/, '')
            const whatsappLink = `https://wa.me/${customerPhone}?text=${whatsappText}`
            
            setGeneratedReview({
                review: data.review,
                whatsappLink,
            })
            setCurrentStep(3)
        } catch (error) {
            console.error(error)
            customerForm.setError("root", {
                type: "manual",
                message: "Failed to generate review. Please try again.",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const regenerateReview = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch("/api/generate-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, regenerate: true }),
            })

            if (!response.ok) {
                throw new Error("Failed to regenerate review")
            }

            const data = await response.json()
            const whatsappText = encodeURIComponent(data.review)
            const customerPhone = (formData.customerPhone || '').replace(/\s+/g, '').replace(/^0+/, '')
            const whatsappLink = `https://wa.me/${customerPhone}?text=${whatsappText}`
            
            setGeneratedReview({
                review: data.review,
                whatsappLink,
            })
        } catch (error) {
            console.error(error)
        } finally {
            setIsGenerating(false)
        }
    }

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step)
        }
    }

    const resetForm = () => {
        setCurrentStep(1)
        setGeneratedReview(null)
        setFormData({})
        orgForm.reset()
        customerForm.reset()
    }

    // Step 1: Organization Information
    if (currentStep === 1) {
        return (
            <div className="form-container" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <StepIndicator currentStep={currentStep} />
                
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Kalyaa Jewellers</h2>
                            <p className="text-[11px] text-gray-500">Enter shop and attender details</p>
                        </div>
                    </div>
                    <PremiumBadge />
                </div>
                
                <Form {...orgForm}>
                    <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="divide-y divide-gray-100">
                        {/* Fixed Business Name */}
                        <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-violet-600 font-medium uppercase tracking-wider">Business</p>
                                    <h3 className="text-lg font-bold text-gray-800">Kalyaa Jewellers</h3>
                                    <p className="text-xs text-gray-500">Premium Jewellery Store</p>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={orgForm.control}
                            name="attenderName"
                            render={({ field }) => (
                                <FormItem className="px-5 py-4 space-y-2 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-violet-500" />
                                        <FormLabel className="text-sm font-semibold text-gray-700">Attender Name *</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter your name (salesperson/attender)" 
                                            className="h-11 text-sm border-gray-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={orgForm.control}
                            name="shopLocation"
                            render={({ field }) => (
                                <FormItem className="px-5 py-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="w-4 h-4 text-violet-500" />
                                        <FormLabel className="text-sm font-semibold text-gray-700">Shop Location *</FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {SHOP_LOCATIONS.map((location) => {
                                                const isSelected = field.value === location.value
                                                return (
                                                    <button
                                                        key={location.value}
                                                        type="button"
                                                        onClick={() => field.onChange(location.value)}
                                                        className={`
                                                            relative p-3 rounded-xl border-2 transition-all duration-200 text-left
                                                            ${isSelected 
                                                                ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-500 shadow-md' 
                                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className={`text-sm font-semibold ${isSelected ? 'text-violet-700' : 'text-gray-700'}`}>
                                                                    {location.label}
                                                                </p>
                                                                <p className={`text-xs ${isSelected ? 'text-violet-500' : 'text-gray-500'}`}>
                                                                    {location.address}
                                                                </p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={orgForm.control}
                            name="orgDescription"
                            render={({ field }) => (
                                <FormItem className="px-5 py-4 space-y-2 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lightbulb className="w-4 h-4 text-violet-500" />
                                        <FormLabel className="text-sm font-semibold text-gray-700">Additional Notes <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional context about this shop or location..."
                                            className="min-h-[80px] text-sm border-gray-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20 resize-none transition-all"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] group"
                            >
                                Continue to Customer Info
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        )
    }

    // Step 2: Customer Information
    if (currentStep === 2) {
        return (
            <div className="form-container" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <StepIndicator currentStep={currentStep} />
                
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Customer Details</h2>
                            <p className="text-[11px] text-gray-500">Quick selections - no typing needed!</p>
                        </div>
                    </div>
                    <PremiumBadge />
                </div>
                
                <Form {...customerForm}>
                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        
                        <SectionHeader 
                            icon={User} 
                            title="Customer Information" 
                            subtitle="Basic details about the customer"
                        />
                        
                        <div className="px-5 py-4 space-y-4">
                            <FormField
                                control={customerForm.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Customer Name</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter customer's full name" 
                                                className="h-11 text-sm border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="customerPhone"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-blue-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">WhatsApp Number</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                type="tel"
                                                placeholder="+91 98765 43210" 
                                                className="h-11 text-sm border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SectionHeader 
                            icon={ShoppingBag} 
                            title="Purchase Details" 
                            subtitle="Information about the purchase"
                        />

                        <div className="px-5 py-4 space-y-4">
                            <FormField
                                control={customerForm.control}
                                name="purchaseType"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-emerald-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">What was purchased?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                placeholder="e.g., Gold Necklace, Diamond Ring" 
                                                className="h-11 text-sm border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="purchaseFrequency"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">How often do they buy?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <SelectCard
                                                options={PURCHASE_FREQUENCY_OPTIONS}
                                                value={field.value}
                                                onChange={field.onChange}
                                                showDescription={true}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="purchaseDuration"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Customer since <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input 
                                                placeholder="e.g., 2 years" 
                                                className="h-11 text-sm border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="events"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">What's the occasion?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <MultiSelectEventsWithOther
                                                value={field.value}
                                                onChange={field.onChange}
                                                otherValue={customerForm.watch("eventOther") || ""}
                                                onOtherChange={(value) => customerForm.setValue("eventOther", value)}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SectionHeader 
                            icon={Star} 
                            title="Experience Ratings" 
                            subtitle="Rate the customer experience"
                        />

                        <div className="px-5 py-4 space-y-4">
                            <FormField
                                control={customerForm.control}
                                name="satisfactionLevel"
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <FormControl>
                                            <RatingSlider
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Overall Satisfaction"
                                                icon={ThumbsUp}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500 mt-2" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="recommendationLikelihood"
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <FormControl>
                                            <RatingSlider
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Likelihood to Recommend"
                                                icon={Heart}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500 mt-2" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            <FormField
                                control={customerForm.control}
                                name="keyHighlights"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Key Highlights <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What did the customer appreciate most? e.g., excellent service, product quality..."
                                                className="min-h-[80px] text-sm border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 resize-none transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="improvementAreas"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-amber-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Areas for Improvement <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Any constructive feedback? e.g., waiting time, pricing..."
                                                className="min-h-[80px] text-sm border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 resize-none transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SectionHeader 
                            icon={Brain} 
                            title="Customer Psychology" 
                            subtitle="Quick selections - understand their mindset"
                        />

                        <div className="px-5 py-4 space-y-6 pb-6">
                            <FormField
                                control={customerForm.control}
                                name="shoppingMotivation"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-rose-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">What motivated them to buy?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <MultiSelectMotivation
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="priceSensitivity"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-rose-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Price Sensitivity</FormLabel>
                                        </div>
                                        <FormControl>
                                            <SelectCard
                                                options={PRICE_SENSITIVITY_OPTIONS}
                                                value={field.value}
                                                onChange={field.onChange}
                                                showDescription={true}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="brandLoyalty"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-rose-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Brand Loyalty Level</FormLabel>
                                        </div>
                                        <FormControl>
                                            <SelectCard
                                                options={BRAND_LOYALTY_OPTIONS}
                                                value={field.value}
                                                onChange={field.onChange}
                                                showDescription={true}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={customerForm.control}
                                name="emotionalConnection"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-rose-500" />
                                            <FormLabel className="text-sm font-semibold text-gray-700">Emotional Connection</FormLabel>
                                        </div>
                                        <FormControl>
                                            <SelectCard
                                                options={EMOTIONAL_CONNECTION_OPTIONS}
                                                value={field.value}
                                                onChange={field.onChange}
                                                showDescription={true}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 space-y-3 sticky bottom-0">
                            {customerForm.formState.errors.root && (
                                <p className="text-xs text-red-500 text-center">{customerForm.formState.errors.root.message}</p>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goBack}
                                    className="flex-1 h-12 text-sm font-semibold rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all"
                                >
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="flex-[2] h-12 text-sm font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-violet-500/30 transition-all active:scale-[0.98] group"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            Generate Review
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        )
    }

    // Step 3: Generated Review
    if (currentStep === 3 && generatedReview) {
        return (
            <div className="form-container" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <StepIndicator currentStep={currentStep} />
                
                <div className="px-5 py-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Generated Review</h2>
                                <p className="text-[11px] text-white/80">Review completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    <div className="relative bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 rounded-2xl p-5 border border-violet-200 shadow-inner">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {generatedReview.review}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={regenerateReview}
                            disabled={isGenerating}
                            className="flex-1 h-11 text-sm font-semibold rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-all"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                </>
                            )}
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(generatedReview.review)}
                            className="flex-1 h-11 text-sm font-semibold rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Copy Text
                        </Button>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                        <a
                            href={generatedReview.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <Button
                                className="w-full h-13 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                                    <Share2 className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold">Share on WhatsApp</div>
                                    <div className="text-[10px] font-medium text-white/80">Open chat with customer</div>
                                </div>
                                <ArrowRight className="ml-auto w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </a>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetForm}
                        className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Start New Review
                    </Button>
                </div>
            </div>
        )
    }

    return null
}
