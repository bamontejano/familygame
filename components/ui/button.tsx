import { Pressable, Text, PressableProps, ViewStyle, TextStyle } from "react-native";

interface ButtonProps extends PressableProps {
    title?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "error" | "success";
    size?: "sm" | "md" | "lg";
    className?: string;
    textClassName?: string;
    children?: React.ReactNode;
}

export function Button({
    title,
    variant = "primary",
    size = "md",
    className = "",
    textClassName = "",
    children,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const getVariantClass = () => {
        switch (variant) {
            case "primary": return "bg-primary";
            case "secondary": return "bg-secondary";
            case "outline": return "bg-transparent border border-border";
            case "ghost": return "bg-transparent";
            case "error": return "bg-error";
            case "success": return "bg-success";
            default: return "bg-primary";
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case "sm": return "px-3 py-1.5";
            case "md": return "px-4 py-2";
            case "lg": return "px-6 py-3";
            default: return "px-4 py-2";
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                { opacity: (pressed || disabled) ? 0.7 : 1 },
                style as ViewStyle
            ]}
            disabled={disabled}
            className={`rounded-2xl items-center justify-center flex-row ${getVariantClass()} ${getSizeClass()} ${className}`}
            {...props}
        >
            {children ? children : (
                <Text className={`font-bold text-center ${variant === 'outline' || variant === 'ghost' ? 'text-foreground' : 'text-black'} ${size === 'lg' ? 'text-lg' : 'text-base'} ${textClassName}`}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}
