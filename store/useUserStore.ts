import { create } from "zustand";
import { persist } from "zustand/middleware";

//PRODUCT ID
interface ProfileChat {
	chat_name: string;
	photo_url: string;
	language: string;
	setLanguage: (lang: string) => void;
	setPhotoUrl: (url: string) => void;
	setChatName: (name: string) => void;
	reset: () => void;
}

const initialState = {
	chat_name: "",
    photo_url: "",
	language: ""
};

export const useUserStore = create<
	ProfileChat,
	[["zustand/persist", ProfileChat]]
>(
	persist(
		(set) => ({
			...initialState,
			setLanguage: (language) => set(() => ({ language })),
			setPhotoUrl: (photo_url) => set(() => ({ photo_url })),
			setChatName: (chat_name) => set(() => ({ chat_name })),
			reset: () => set(initialState),
		}),
		{
			name: "client-storage",
			getStorage: () => localStorage,
		}
	)
);