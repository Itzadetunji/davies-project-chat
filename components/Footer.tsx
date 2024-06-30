import Image from "next/image";
import Link from "next/link";
import React from "react";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";

const Footer = () => {
	const lists = ["Careers", "Contact"];
	const policyLinks = [
		"Terms & Condition",
		"Privacy Policy",
		"Accessibility",
		"Legal",
	];
	return (
		<footer className="mt-4 rounded-t-[50px] bg-primary px-[45px] pb-[45px] pt-[70px]">
			<Image src="/handsfree-logo.svg" alt="" width={100} height={100} />
			<section className="flex items-center justify-between">
				<ul className="flex space-x-8 font-light text-white">
					{lists.map((item, i) => (
						<Link href={"/" + item.toLowerCase()} key={i}>
							{item}
						</Link>
					))}
				</ul>
				{/* <ul className="flex items-end space-x-10 font-medium">
					<div>
						<p className="text-white">
							Get the freshest news from us
						</p>
						<Input />
					</div>
					<Button className="bg-[#3E0C96] px-7 py-2 font-medium">
						Subscribe
					</Button>
				</ul> */}
			</section>
			<hr className="my-4 border-[#98A2B3]" />
			<section className="flex justify-between font-light text-[#98A2B3]">
				<ul className="flex">
					{policyLinks.map((item, i) => (
						<li
							className={`${i !== policyLinks.length - 1 && "border-r"} border-r-[#98A2B3] ${i !== 0 && "pl-3"} pr-3`}
							key={i}
						>
							{item}
						</li>
					))}
				</ul>
				<h1>HandsFree Football Academy. All rights reserved, 2024</h1>
			</section>
		</footer>
	);
};

export default Footer;
