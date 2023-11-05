package com.vivatechrnd.sms.utility;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse {
  public boolean last;
  public int totalPages;
  public int totalElements;
  public int size;
  public int number;
  public boolean first;
  public int numberOfElements;
}
