const personReportsToFeedbacks = (cards) => {
  const result = cards.map((card) => {
    card.personalReports = card.personalReports.filter(
      (report) => (report.feedbacks.length)
    );
    card.personalFeedbacks = card.personalReports.map((report) => {
      if(report.feedbacks.length){
        const feedback = { ...report.feedbacks[0] };
        feedback.createdBy = report.user;
        feedback.date = report.date;
        feedback.report = report._id;
        return feedback;
      }
    });
    delete card.personalReports;
    return card;
  });
  // console.log(result);
  return cards;
}

module.exports = {
  personReportsToFeedbacks,
}