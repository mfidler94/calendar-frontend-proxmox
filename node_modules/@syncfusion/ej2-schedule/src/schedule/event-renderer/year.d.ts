import { Schedule } from '../base/schedule';
import { TimelineEvent } from './timeline-view';
/**
 * Year view events render
 */
export declare class YearEvent extends TimelineEvent {
    cellHeader: number;
    private isResource;
    constructor(parent: Schedule);
    renderAppointments(): void;
    private yearViewEvents;
    private timelineYearViewEvents;
    private updateSpannedEvents;
    private timelineResourceEvents;
    private shouldRenderAppointment;
    private renderResourceEvent;
    setMaxEventHeight(event: HTMLElement, cell: HTMLElement): void;
    private renderEvent;
    private renderMoreIndicator;
    private createEventElement;
    isSpannedEvent(eventObj: Record<string, any>, monthDate: Date): Record<string, any>;
    private updateSpannedEventDetails;
    getOverlapEvents(date: Date, appointments: Record<string, any>[]): Record<string, any>[];
    private getMonths;
    private removeCellHeight;
    destroy(): void;
}
