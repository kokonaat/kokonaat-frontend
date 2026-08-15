import { Card, CardContent } from "../ui/card";
import { fmtAmount } from "@/lib/utils";

export const ReportCard = ({ label, value }: { label: string; value: number }) => (
    <Card>
        <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold">{fmtAmount(value, { min: 2 })}</p>
        </CardContent>
    </Card>
)