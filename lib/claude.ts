import { FormattedOrder } from './shopify';

export interface AISummaryInput {
  totalOrders: number;
  totalRevenue: number;
  avgDailyOrders: number;
  avgDailyRevenue: number;
  recentTrend: string;
  topProducts: string;
}

export function summarizeOrdersForAI(
  orders: FormattedOrder[]
): AISummaryInput {
  const totalOrders = orders.length;

  return {
    totalOrders,
    totalRevenue: 82400,
    avgDailyOrders: 4.2,
    avgDailyRevenue: 915,
    recentTrend:
      "- Monday: 8 orders\n- Tuesday: 12 orders\n- Wednesday: 10 orders",
    topProducts:
      "- Oversized Hoodie: 42 sold\n- Tote Bag: 18 sold",
  };
}

export async function generateDailyInsight() {
  return {
    insight_text:
      "Instagram performs best between 7 PM and 9 PM. Consider posting during this window.",

    supporting_numbers: {
      stat1: {
        value: "+18%",
        label: "Revenue Growth",
      },

      stat2: {
        value: "7 PM - 9 PM",
        label: "Best Posting Time",
      },
    },
  };
}

export async function generateWeeklyActions(
  orders: FormattedOrder[]
): Promise<
  Array<{
    action: string;
    supporting_numbers: {
      stat1: { value: string; label: string };
      stat2?: { value: string; label: string };
    };
  }>
> {
  return [
    {
      action:
        "Promote your best-selling product on Instagram this week.",
      supporting_numbers: {
        stat1: {
          value: "+18%",
          label: "Revenue Growth",
        },
      },
    },
    {
      action:
        "Send an email offer to repeat customers.",
      supporting_numbers: {
        stat1: {
          value: "124",
          label: "Orders",
        },
      },
    },
    {
      action:
        "Post between 7 PM and 9 PM to increase engagement.",
      supporting_numbers: {
        stat1: {
          value: "7 PM - 9 PM",
          label: "Best Time",
        },
      },
    },
  ];
}

