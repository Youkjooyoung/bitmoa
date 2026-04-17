package com.bitmoa.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class OrderRequest {

    @NotBlank(message = "마켓 코드를 입력해주세요.")
    private String market;

    @NotBlank(message = "주문 유형을 입력해주세요.")
    private String orderType;

    @NotBlank(message = "주문 방식을 입력해주세요.")
    private String orderMethod;

    private BigDecimal price;

    @NotNull(message = "주문 수량을 입력해주세요.")
    @DecimalMin(value = "0.00000001", message = "주문 수량은 0보다 커야 합니다.")
    private BigDecimal quantity;
}
