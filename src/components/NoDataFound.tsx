import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "./ui/empty"
import type { ReactNode } from "react"

interface NoDataFoundProps {
    icon: ReactNode
    message: string
    details?: string
}

export function NoDataFound({ icon, message, details }: NoDataFoundProps) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">{icon}</EmptyMedia>
                <EmptyTitle>{message}</EmptyTitle>
                {details && <EmptyDescription>{details}</EmptyDescription>}
            </EmptyHeader>
        </Empty>
    )
}