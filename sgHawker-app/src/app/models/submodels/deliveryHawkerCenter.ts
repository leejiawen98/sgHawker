import { Order } from "../order";

export class DeliveryHawkerCenter {
    hawkerCenterName: string | undefined;
    cuisineTypes: string[] | undefined;
    orders: Order[] | undefined;

    constructor(
        hawkerCenterName?: string,
        cuisineTypes?: string[],
        orders?: Order[]
    ) {
        this.hawkerCenterName = hawkerCenterName;
        this.cuisineTypes = cuisineTypes;
        this.orders = orders;
    }
}
