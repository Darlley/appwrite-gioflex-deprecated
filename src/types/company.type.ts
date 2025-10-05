import { Models } from "appwrite";

export interface CompanyCollection extends Models.Document {
    name: string;
    userId: string;
    headerTitle?: string;
    headerDescription?: string;
    header_action?: string;
    footerPhone?: string;
    footerEmail?: string;
    footerAddress?: string;
    instagram?: string;
    facebook?: string;
    active_website?: boolean;
    htmlMap?: string;
}
