import {GetSetting} from "@/api/SettingApi";
import {useApiHandler} from "@/hooks/useApiHandler";

export const useGetSetting = () => {
    return useApiHandler(GetSetting)
}