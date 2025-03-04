import MenuLayout from "@/components/SiderMenuLayout";

export default async function mainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<MenuLayout>{children}</MenuLayout>);
}


