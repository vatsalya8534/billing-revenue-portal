import HomePage from "@/components/home/home-page";
import { getConfiguration } from "@/lib/actions/configuration";

export default async function Page() {
  const configuration = await getConfiguration();

  return (
    <HomePage
      configuration={
        configuration
          ? {
              name: configuration.name,
              logo: configuration.logo,
            }
          : undefined
      }
    />
  );
}
