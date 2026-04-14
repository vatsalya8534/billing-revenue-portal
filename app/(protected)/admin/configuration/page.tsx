import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions/configuration";

const ConfigurationPage = async () => {
    const configuration = await getConfiguration();

    return (
        <ConfigurationForm
            data={
                configuration
                    ? {
                        id: configuration.id,
                        name: configuration.name || undefined,
                        logo: configuration.logo || undefined,
                        favicon: configuration.favicon || undefined,
                        email: configuration.email || undefined,
                        password: configuration.password || undefined,
                    }
                    : undefined
            }
        />
    );
};

export default ConfigurationPage;
