import React, { useState } from "react";
import { Platform, Text, TextInput, TextInputProps, View } from "react-native";
import colors from "../constants/colors";

interface TextFieldProps extends TextInputProps {
  label?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export function TextField({
  label,
  invalid = false,
  containerClassName = "",
  multiline,
  onFocus,
  onBlur,
  style,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  // Phones grow multiline inputs by themselves; a web textarea does not, so
  // long steps would be cut off without tracking the content height.
  const [webContentHeight, setWebContentHeight] = useState(0);
  // The border doubles as the focus indicator: accent on focus, danger on error.
  const border = invalid ? "border-danger" : focused ? "border-accent" : "border-field";
  const autoGrow =
    multiline && Platform.OS === "web" && webContentHeight > 0 ? { height: webContentHeight + 2 } : null;

  return (
    <View className={containerClassName}>
      {label ? <Text className="mb-1.5 text-sm font-semibold text-ink">{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
        onContentSizeChange={
          multiline && Platform.OS === "web"
            ? e => setWebContentHeight(e.nativeEvent.contentSize.height)
            : undefined
        }
        // text-base (16px) also stops mobile Safari from zooming in on focus.
        className={`min-h-[44px] rounded-xl border bg-surface px-3.5 py-2.5 text-base text-ink ${border}`}
        style={[multiline ? { minHeight: 88, textAlignVertical: "top" } : null, style, autoGrow]}
        {...props}
      />
    </View>
  );
}
