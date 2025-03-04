import { requestGet } from "@/lib/api-server";
export default async function Home() {

  try {
    const res = await requestGet("/users/getRole");
    console.log(res);
  } catch (error) {
    throw error;
  }

  return (
    <div>
      dashboard
    </div>
  );
}