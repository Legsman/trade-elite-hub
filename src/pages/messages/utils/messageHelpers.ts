
export const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

export const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  }
};

export const groupMessagesByDate = (messages: any[]) => {
  const groups: { date: Date; messages: any[] }[] = [];

  messages.forEach(message => {
    const messageDate = new Date(message.createdAt);
    messageDate.setHours(0, 0, 0, 0);

    const existingGroup = groups.find(group => 
      group.date.getTime() === messageDate.getTime()
    );

    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        messages: [message],
      });
    }
  });

  return groups;
};
