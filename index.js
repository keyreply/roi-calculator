const format = function (value, prefix = "") {
  const v = Math.round(value);
  return prefix + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Vue.component("kr-chart", {
  props: ["id", "data"],
  data: function () {
    const vm = this;
    return {
      chart: null,
      total: 0,
      options: {
        series: [],
        chart: {
          type: "bar",
          stacked: true,
          stackType: "100%",
          height: "400px",
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            columnWidth: "50%",
            barHeight: "100%",
            dataLabels: {
              hideOverflowingLabels: false,
            },
          },
        },
        tooltip: {
          enabled: false,
        },
        stroke: {
          width: 1,
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "15px",
            colors: ["#00ACC1", "#FFB300", "#e4392b", "#66bb6a"],
          },
          background: {
            enabled: true,
            borderRadius: 2,
            padding: 4,
            borderWidth: 1,
          },
          formatter: function (val) {
            const percent = val / 100;
            return format(vm.data.total * percent, "$");
          },
        },
        grid: {
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        colors: ["#00ACC1", "#FFB300", "#e4392b", "#66bb6a"],
        fill: {
          type: ['solid', 'solid', 'solid', 'pattern'],
          pattern: {
            style: 'slantedLines',
            width: 6,
            height: 6,
            strokeWidth: 1
          }
        },
        xaxis: {
          categories: ["A"],
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
          },
        },
        legend: {
          show: false,
        },
      },
    };
  },
  template: `<div :id="id"></div>`,
  methods: {
    render() {
      const chartElement = document.querySelector(`#${this.id}`);
      chartElement.innerHTML = "";
      this.options.series = this.data.series;
      this.chart = new ApexCharts(chartElement, this.options);
      this.chart.render();
    },
  },
});

Vue.component("kr-label", {
  props: ["label", "hint"],
  template: `<p class="mb-2 text-body-1 font-weight-medium">
      {{label}}
      <v-tooltip v-if="hint" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn x-small icon v-bind="attrs" v-on="on">
            <v-icon color="dark lighten-1">fa-info-circle</v-icon>
          </v-btn>
        </template>
        <span v-html="hint"></span>
      </v-tooltip>
    </p>`,
});

Vue.component("kr-slider", {
  data: function () {
    return {
      value: 0,
    };
  },
  props: [
    "default",
    "max",
    "min",
    "label",
    "tagAppend",
    "tagPrepend",
    "hint",
    "description",
    "step"
  ],
  filters: {
    format,
  },
  methods: {
    onChange: function (event) {
      this.value = event.target.value;
      this.$emit("change", event.target.value);
    },
  },
  mounted() {
    this.value = this.default;
    this.$emit("change", this.default);
  },
  computed: {
    tagStyle() {
      const maxCount = this.max.toString().length;
      const tagAppendCount = (this.tagAppend || "").length;
      const tagPrependCount = (this.tagPrepend || "").length;
      const total = maxCount + tagAppendCount + tagPrependCount;
      return {
        width: total * 10 + "px",
      };
    },
  },
  template: `<div class="mb-10">
    <kr-label :hint="hint" :label="label"></kr-label>
    <p v-if="description" class="mb-2 text-body-2">{{ description }} </p>
    <div class="range-slider">
      <input @input="onChange" class="range-slider__range" type="range" :value="value" :min="min" :max="max" :step="step">
      <span :style="tagStyle" class="range-slider__value">
        {{ tagPrepend || '' }}{{ (value || 0) | format}}{{ tagAppend || '' }}
      </span>
    </div>
    </div>`,
});

Vue.component("kr-hours-counter", {
  data: function () {
    return {
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeksPerYear: 52,
    };
  },
  props: ["label", "hint"],
  methods: {
    onChange() {
      this.$emit("change", this.totalInHours);
    },
  },
  mounted() {
    this.onChange();
  },
  computed: {
    totalInHours() {
      return this.daysPerWeek * this.hoursPerDay * this.weeksPerYear;
    },
  },
  template: `<div class="mb-10">
    <kr-label :hint="hint" :label="label"></kr-label>
    <br>
    <v-row>
      <v-col class="py-0" >
        <v-text-field @change="onChange" v-model="hoursPerDay" color="dark" type="number" suffix="hours/day" single-line solo dense></v-text-field>
      </v-col>
      <v-col class="py-0" >
        <v-text-field @change="onChange" v-model="daysPerWeek" color="dark" type="number" suffix="days/week" single-line solo dense></v-text-field>
      </v-col>
    </v-row>
    </div>`,
});

new Vue({
  el: "#app",
  vuetify: new Vuetify({
    theme: {
      themes: {
        light: {
          primary: "#e4392b",
        },
      },
    },
    icons: {
      iconfont: "fas",
    },
  }),
  watch: {
    cost: {
      handler: _.debounce(
        function () {
          this.$refs["chart-without-bot"].render();
          this.$refs["chart-with-bot"].render();
        },
        500,
        {
          leading: false,
        }
      ),
    },
  },
  data: function () {
    return {
      numberOrLiveChatAgents: 0,
      liveChatAvailability: 0,
      averageCompensationPerAgent: 0,
      averageLengthOfChat: 0,
      numberOfConcurrentChatsPerAgent: 0,
      anticipatedChatVolumnGrowth: 0,
      automationRate: 0
    };
  },
  filters: {
    format,
  },
  computed: {
    anticipatedChatVolumnGrowthPercent() {
      const anticipatedChatVolumnGrowth =
        parseInt(this.anticipatedChatVolumnGrowth) / 100;
      return 1.0 + anticipatedChatVolumnGrowth;
    },
    annualChatCapacity() {
      const averageLengthOfChat = parseInt(this.averageLengthOfChat);
      const numberOfConcurrentChatsPerAgent = parseInt(
        this.numberOfConcurrentChatsPerAgent
      );
      const liveChatAvailability = parseInt(this.liveChatAvailability);
      const activeAgent = parseInt(this.numberOrLiveChatAgents);
      const chatHours =
        (60 / averageLengthOfChat) * numberOfConcurrentChatsPerAgent;

      const current = chatHours * activeAgent * liveChatAvailability;
      const future = this.anticipatedChatVolumnGrowthPercent * current;
      return {
        current,
        future,
      };
    },
    futureAgents() {
      const numberOrLiveChatAgents = parseInt(this.numberOrLiveChatAgents);
      const total = Math.ceil(
        numberOrLiveChatAgents * this.anticipatedChatVolumnGrowthPercent
      );
      const addition = total - numberOrLiveChatAgents;
      return {
        total,
        addition,
      };
    },
    cost() {
      let chatbotRate = 0.014;
      const chatbotCost = 50000 + (3000 * 12);
      const automationRate = 1 - this.automationRate / 100;
      const numberOrLiveChatAgents = parseInt(this.numberOrLiveChatAgents);
      const additionalChats =
        this.annualChatCapacity.future - this.annualChatCapacity.current;
      const averageCompensationPerAgent = parseInt(
        this.averageCompensationPerAgent
      );

      const withoutBotLabourCost =
        this.futureAgents.total * averageCompensationPerAgent;
      const withoutBotSystemCost = this.futureAgents.total * 1308;
      const withoutBotTotalCost = withoutBotLabourCost + withoutBotSystemCost;

      if (additionalChats >= 5000000) {
        chatbotRate = 0.006;
      } else if (additionalChats >= 2000000) {
        chatbotRate = 0.007;
      } else if (additionalChats >= 1000000) {
        chatbotRate = 0.008;
      } else if (additionalChats >= 500000) {
        chatbotRate = 0.009;
      } else if (additionalChats >= 200000) {
        chatbotRate = 0.01;
      } else if (additionalChats >= 100000) {
        chatbotRate = 0.011;
      } else if (additionalChats >= 50000) {
        chatbotRate = 0.012;
      }
      const additionalChatsCost = additionalChats * chatbotRate;
      const withBotCost = chatbotCost + additionalChatsCost;
      const withBotLabourCost = numberOrLiveChatAgents * averageCompensationPerAgent * automationRate;
      const withBotLiveChatCost = 12 * (160 * numberOrLiveChatAgents) + 2000
      const withBotTotalCost = withBotCost + withBotLabourCost + withBotLiveChatCost;

      const saved = withoutBotTotalCost - withBotTotalCost;
      const roiInOneYear = ((saved - withBotCost) / withBotCost) * 100;
      const paybackPeriod = (withBotCost / saved) * 365 / 30;
      return {
        roiInOneYear,
        paybackPeriod,
        withoutBot: {
          total: withoutBotTotalCost,
          series: [
            {
              name: "Labor cost",
              data: [(withoutBotLabourCost / withoutBotTotalCost) * 100],
            },
            {
              name: "Live chat cost",
              data: [
                ((withoutBotTotalCost - withoutBotLabourCost) /
                  withoutBotTotalCost) *
                100,
              ],
            },
          ],
        },
        withBot: {
          total: withBotTotalCost,
          series: [
            {
              name: "Labor cost",
              data: [(withBotLabourCost / withoutBotTotalCost) * 100],
            },
            {
              name: "Live chat cost",
              data: [(withBotLiveChatCost / withoutBotTotalCost) * 100],
            },
            {
              name: "Chatbot cost",
              data: [(withBotCost / withoutBotTotalCost) * 100],
            },
            {
              name: "Savings",
              data: [(withoutBotTotalCost - withBotTotalCost) / withoutBotTotalCost * 100],
            },
          ],
        },
      };
    },
  },
});
