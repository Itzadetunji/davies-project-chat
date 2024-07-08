interface TelegramWebApp {
	initData: string;
	initDataUnsafe: {
		query_id: string;
		user: TelegramUser;
		auth_date: number;
		hash: string;
	};
	version: string;
	platform: string;
	colorScheme: "light" | "dark";
	themeParams: {
		bg_color: string;
		text_color: string;
		hint_color: string;
		link_color: string;
		button_color: string;
		button_text_color: string;
		header_bg_color: string;
	};
	isExpanded: boolean;
	viewportHeight: number;
	viewportStableHeight: number;
	headerColor: string;
	backgroundColor: string;
	BackButton: {
		isVisible: boolean;
		show: () => void;
		hide: () => void;
		onClick: (callback: () => void) => void;
		offClick: (callback: () => void) => void;
	};
	MainButton: {
		isVisible: boolean;
		setParams: (params: {
			text?: string;
			color?: string;
			textColor?: string;
			is_active?: boolean;
			is_visible?: boolean;
		}) => void;
		show: () => void;
		hide: () => void;
		enable: () => void;
		disable: () => void;
		onClick: (callback: () => void) => void;
		offClick: (callback: () => void) => void;
	};
	HapticFeedback: {
		impactOccurred: (
			style: "light" | "medium" | "heavy" | "rigid" | "soft"
		) => void;
		notificationOccurred: (type: "success" | "warning" | "error") => void;
		selectionChanged: () => void;
	};
	close: () => void;
	expand: () => void;
	onEvent: (eventType: string, callback: () => void) => void;
	offEvent: (eventType: string, callback: () => void) => void;
	sendData: (data: string) => void;
	setHeaderColor: (color: string) => void;
}

interface Window {
	Telegram: {
		WebApp: TelegramWebApp;
	};
}

interface TelegramUser {
	id: number;
	first_name: string;
	last_name: string;
	username: string;
	language_code: string;
	is_premium?: boolean;
	photo_url?: string;
}
