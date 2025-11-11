FROM eclipse-temurin:17-jre as base
WORKDIR /app

FROM maven:3.9-eclipse-temurin-17 as build
WORKDIR /src
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

FROM base
COPY --from=build /src/target/backend-*.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]









