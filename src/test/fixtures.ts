export const validVixCsv = `DATE,OPEN,HIGH,LOW,CLOSE
2024-01-02,14,15,13,14
2024-01-03,15,16,14,15
2024-01-04,18,19,17,18`;

export const malformedVixCsv = `DATE,OPEN
2024-01-02,14`;

export const validPutCallHtml = `
<html>
  <body>
    <div>TOTAL PUT/CALL RATIO</div><div>0.94</div>
    <div>EQUITY PUT/CALL RATIO</div><div>0.62</div>
    <div>INDEX PUT/CALL RATIO</div><div>1.21</div>
    <div>SPX + SPXW PUT/CALL RATIO</div><div>1.48</div>
  </body>
</html>`;

export const missingPutCallHtml = `<html><body>No ratios today</body></html>`;

export const validCnnPayload = {
  fear_and_greed: {
    score: 31.4,
    rating: "fear",
    previous_close: 29.8,
  },
};

export const malformedCnnPayload = {
  fear_and_greed: {
    rating: "fear",
  },
};
