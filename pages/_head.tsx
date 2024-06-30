"use client";
import Head from "next/head";

type HeadTagProps = {
	title?: string;
};
export const HeadTag = ({ title }: HeadTagProps) => {
	const pageTitle = Array.isArray(title)
		? title.join(" | ") + " | HandsFree Soccer"
		: title + " | HandsFree Soccer" || "HandsFree Soccer";

	return (
		<Head>
			<title>{pageTitle}</title>
			<meta property="og:site_name" content="HandsFree Soccer"></meta>
			<meta property="og:url" content="/"></meta>
			<meta property="og:locale" content="en_NG"></meta>
			<meta
				name="description"
				content="Handsfree Soccer helps retail merchants grow their business by accessing inventory financing."
			/>
			<meta
				name="keywords"
				content="Finance, Inventory, Retail distribution, Loans, Savings, Insurance, Distributor Loan, Retailers Loan"
			/>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
		</Head>
	);
};

export default HeadTag;
