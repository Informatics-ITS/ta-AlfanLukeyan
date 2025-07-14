/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1ECEFF';
const tintColorDark = '#BE1BB6';

export const Colors = {
    light: {
        title: '#000',
        text: '#11181C',
        subtitle: tintColorLight,
        placeholder: "gray",
        background: '#fff',
        button: '#11181C',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        cardBackground: '#F4F4F4',
        border: 'gray',
        error: '#FF3B30',
        shadow: '#000',
    },
    dark: {
        title: '#fff',
        text: '#ECEDEE',
        subtitle: tintColorDark,
        placeholder: "gray",
        background: '#000',
        button: '#ffff',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        cardBackground: '#151515',
        border: 'gray',
        error: '#FF3B30',
        shadow: '#fff',
    },
};
