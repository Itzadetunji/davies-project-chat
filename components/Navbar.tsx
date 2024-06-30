import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
	const [scrollReport, setScrollReport] = useState(false);
	const path_name = usePathname();
	useEffect(() => {
		window?.addEventListener("scroll", () => {
			setScrollReport(window.scrollY > 50);
		});
		return () =>
			window?.removeEventListener("scroll", () => {
				setScrollReport(window.scrollY > 50);
			});
	}, []);
	return (
		<nav
			className={cn(
				"sticky top-0 z-[99] flex items-center bg-transparent px-[82px] duration-300 ease-in-out",
				{
					"fixed w-full text-white": path_name === "/about",
					"bg-white text-[#667085]": scrollReport,
				}
			)}
		>
			<Image src={"/logo.png"} alt={""} width={100} height={100} />
			<ul className="flex flex-1 items-center justify-center space-x-8">
				{NavLinks.map((item, index) => (
					<NavItem {...item} key={index} />
				))}
			</ul>
			<ul className="">
				<NavItem title="Contact" link="/contact" />
			</ul>
		</nav>
	);
};

export default Navbar;

const NavItem: React.FC<{
	title: string;
	link: string;
}> = ({ title, link }) => {
	return (
		<Link href={link}>
			<li
				className={`font-semibold duration-200 ease-in-out hover:text-black`}
			>
				{title}
			</li>
		</Link>
	);
};

const NavLinks = [
	{ title: "Home", link: "/" },
	{ title: "About us", link: "/about" },
	{ title: "Gallery", link: "/gallery" },
];
