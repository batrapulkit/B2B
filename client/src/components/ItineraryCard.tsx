import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, MapPin, Eye, Edit } from "lucide-react";

interface ItineraryCardProps {
  id: string;
  destination: string;
  imageUrl: string;
  duration: string;
  travelers: number;
  budget: string;
  clientName: string;
  status: "draft" | "confirmed" | "completed";
  startDate: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ItineraryCard({
  id,
  destination,
  imageUrl,
  duration,
  travelers,
  budget,
  clientName,
  status,
  startDate,
  onView,
  onEdit,
}: ItineraryCardProps) {
  const statusConfig = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-itinerary-${id}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className={statusConfig[status].className} variant="secondary">
            {statusConfig[status].label}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-heading font-bold text-white mb-1">{destination}</h3>
          <p className="text-sm text-white/90">{clientName}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">{duration}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Travelers</div>
              <div className="font-medium">{travelers}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Start Date</div>
              <div className="font-medium">{startDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground">Budget</div>
              <div className="font-medium">{budget}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(id)}
            data-testid={`button-view-itinerary-${id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onEdit?.(id)}
            data-testid={`button-edit-itinerary-${id}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
