"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPayment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔴 Você tem uma pendência</CardTitle>
        <CardDescription>Pagamento do dia 05/06</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {/* <Calendar
          mode="range"
          selected={{
            from: new Date(2025, 5, 5),
            to: new Date()
          }}
        /> */}
      </CardContent>
      <CardFooter>
        Pagar agora
      </CardFooter>
    </Card>
  )
}
