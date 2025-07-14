// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
    'house.fill': 'home',
    'book.fill': 'book',
    'person.fill': 'person',
    'chevron.left': 'chevron-left',
    'chevron.right': 'chevron-right',
    'ellipsis.vertical.bubble': 'more-vert',
    'circle.fill': 'circle',
    'bookmark.fill': 'bookmark',
    'document.fill': 'description',
    'calendar.circle.fill': 'calendar-today',
    'trash.circle.fill': 'delete',
    'pencil.circle.fill': 'edit',
    'minus.circle.fill': 'remove-circle',
    'checkmark.circle.fill': 'check-circle',
    'plus.circle.fill': 'add-circle',
    'calendar.and.person': 'event',
    'calendar.badge.checkmark': 'event-note',
    'arrow.right': 'arrow-forward',
    'eye.slash.circle.fill': 'visibility-off',
    'eye.circle.fill': 'visibility',
    'left.circle.fill': 'arrow-back',
    'lock.circle.fill': 'lock',
    'phone.fill': 'phone',
    'mail.fill': 'email',
    'person.badge.plus.fill': 'person-add',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
