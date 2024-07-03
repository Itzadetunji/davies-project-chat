import { create } from "zustand";
import { persist } from "zustand/middleware";

//PRODUCT ID
interface ProductId {
	chat_name: string;
	photo_url: string;
	setPhotoUrl: (url: string) => void;
	setChatName: (name: string) => void;
	reset: () => void;
}

const initialState = {
	chat_name: "",
    photo_url: "",
};

export const useUserStore = create<
	ProductId,
	[["zustand/persist", ProductId]]
>(
	persist(
		(set) => ({
			...initialState,
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